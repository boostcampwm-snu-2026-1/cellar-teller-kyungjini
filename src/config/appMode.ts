export const isStaticDemo = import.meta.env.VITE_STATIC_DEMO === 'true'

export const demoVideoUrl = import.meta.env.VITE_DEMO_VIDEO_URL?.trim() || null
