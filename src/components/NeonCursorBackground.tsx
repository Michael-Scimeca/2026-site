"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function NeonCursorBackground() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Constants
        const CONFIG = {
            shaderPoints: 16,
            curvePoints: 80,
            curveLerp: 0.5, // Tweak for trail smoothness
            radius1: 5,
            radius2: 30,
            velocityThreshold: 10,
            sleepRadiusX: 100,
            sleepRadiusY: 100,
            sleepTimeCoefX: 0.0025,
            sleepTimeCoefY: 0.0025
        };

        // Scene Setup
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // State
        const points = new Array(CONFIG.curvePoints).fill(0).map(() => new THREE.Vector2());
        const spline = new THREE.SplineCurve(points);
        const uRatio = { value: new THREE.Vector2() };
        const uSize = { value: new THREE.Vector2() };
        const uPoints = { value: new Array(CONFIG.shaderPoints).fill(0).map(() => new THREE.Vector2()) };
        const uColor = { value: new THREE.Color(0x0158ff) }; // Default blue

        let hover = false;
        let pMouse = new THREE.Vector2(0, 0); // Previous mouse pos

        // Geometry & Material
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            uniforms: { uRatio, uSize, uPoints, uColor },
            defines: {
                SHADER_POINTS: CONFIG.shaderPoints
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                // https://www.shadertoy.com/view/wdy3DD
                // https://www.shadertoy.com/view/MlKcDD
                // Signed distance to a quadratic bezier
                float sdBezier(vec2 pos, vec2 A, vec2 B, vec2 C) {
                    vec2 a = B - A;
                    vec2 b = A - 2.0*B + C;
                    vec2 c = a * 2.0;
                    vec2 d = A - pos;
                    float kk = 1.0 / dot(b,b);
                    float kx = kk * dot(a,b);
                    float ky = kk * (2.0*dot(a,a)+dot(d,b)) / 3.0;
                    float kz = kk * dot(d,a);
                    float res = 0.0;
                    float p = ky - kx*kx;
                    float p3 = p*p*p;
                    float q = kx*(2.0*kx*kx - 3.0*ky) + kz;
                    float h = q*q + 4.0*p3;
                    if(h >= 0.0){
                        h = sqrt(h);
                        vec2 x = (vec2(h, -h) - q) / 2.0;
                        vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
                        float t = uv.x + uv.y - kx;
                        t = clamp( t, 0.0, 1.0 );
                        // 1 root
                        vec2 qos = d + (c + b*t)*t;
                        res = length(qos);
                    } else {
                        float z = sqrt(-p);
                        float v = acos( q/(p*z*2.0) ) / 3.0;
                        float m = cos(v);
                        float n = sin(v)*1.732050808;
                        vec3 t = vec3(m + m, -n - m, n - m) * z - kx;
                        t = clamp( t, 0.0, 1.0 );
                        // 3 roots
                        vec2 qos = d + (c + b*t.x)*t.x;
                        float dis = dot(qos,qos);
                        res = dis;
                        qos = d + (c + b*t.y)*t.y;
                        dis = dot(qos,qos);
                        res = min(res,dis);
                        qos = d + (c + b*t.z)*t.z;
                        dis = dot(qos,qos);
                        res = min(res,dis);
                        res = sqrt( res );
                    }
                    return res;
                }

                uniform vec2 uRatio;
                uniform vec2 uSize;
                uniform vec2 uPoints[SHADER_POINTS];
                uniform vec3 uColor;
                varying vec2 vUv;
                void main() {
                    float intensity = 1.0;
                    float radius = 0.015;

                    vec2 pos = (vUv - 0.5) * uRatio;

                    // Interpolate points
                    vec2 c = (uPoints[0] + uPoints[1]) / 2.0;
                    vec2 c_prev;
                    float dist = 10000.0;
                    for(int i = 0; i < SHADER_POINTS - 1; i++){
                        c_prev = c;
                        c = (uPoints[i] + uPoints[i + 1]) / 2.0;
                        dist = min(dist, sdBezier(pos, c_prev, uPoints[i], c));
                    }
                    dist = max(0.0, dist);

                    float glow = pow(uSize.y / dist, intensity);
                    vec3 col = vec3(0.0);
                    col += 10.0 * vec3(smoothstep(uSize.x, 0.0, dist));
                    col += glow * uColor;

                    // Tone mapping
                    col = 1.0 - exp(-col);
                    col = pow(col, vec3(0.4545));

                    gl_FragColor = vec4(col, 1.0);
                }
            `,
            transparent: true,
        });

        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

        // Handlers
        const onResize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            renderer.setSize(width, height);

            uSize.value.set(CONFIG.radius1, CONFIG.radius2);
            if (width >= height) {
                uRatio.value.set(1, height / width);
                uSize.value.multiplyScalar(1 / width);
            } else {
                uRatio.value.set(width / height, 1);
                uSize.value.multiplyScalar(1 / height);
            }
        };

        const onMouseMove = (e: MouseEvent) => {
            hover = true;
            // Get relative mouse position in container
            const rect = container.getBoundingClientRect();
            // Transform to centered coordinate system (-1 to 1 based on aspect ratio)
            // But here the shader expects (0.5 * Pos) * ratio. It's tricky.
            // Let's mimic the original logic which likely used centered NDC-like coords but mapped to aspect.
            // Actually, in the original code: 
            // x = (0.5 * nPosition.x) * uRatio.value.x
            // where nPosition is normalized device coords (-1 to 1).

            const xRel = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const yRel = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            const x = (0.5 * xRel) * uRatio.value.x;
            const y = (0.5 * yRel) * uRatio.value.y;

            spline.points[0].set(x, y);
            pMouse.set(x, y);
        };

        const onMouseLeave = () => {
            hover = false;
        };

        // Listeners
        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMouseMove);
        // container.addEventListener('mouseleave', onMouseLeave); // Keep active even if left, or simplify

        // Init Resize
        onResize();

        // Loop
        const clock = new THREE.Clock();
        let animationFrameId: number;

        const loop = () => {
            const time = clock.getElapsedTime() * 1000; // ms

            // Update Spline Points (Shift Previous)
            for (let i = 1; i < CONFIG.curvePoints; i++) {
                points[i].lerp(points[i - 1], CONFIG.curveLerp);
            }

            // Update Shader Points (Sample Spline)
            for (let i = 0; i < CONFIG.shaderPoints; i++) {
                spline.getPoint(i / (CONFIG.shaderPoints - 1), uPoints.value[i]);
            }

            // Idle Animation
            if (!hover) {
                const t1 = time * CONFIG.sleepTimeCoefX;
                const t2 = time * CONFIG.sleepTimeCoefY;
                const r1 = CONFIG.sleepRadiusX * 0.002; // Roughly adapted scale
                const r2 = CONFIG.sleepRadiusY * 0.002;

                const x = r1 * Math.cos(t1);
                const y = r2 * Math.sin(t2);
                spline.points[0].set(x, y);
            }

            // Render
            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationFrameId);
            renderer.dispose();
            container.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 mix-blend-screen opacity-60" />
    );
}
