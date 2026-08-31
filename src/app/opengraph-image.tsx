import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'منصة المهندس — م/ رضا خيرت لتعليم الرياضيات';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A0F1D 0%, #030712 100%)',
          position: 'relative',
          padding: '60px',
        }}
      >
        {/* Glow circle */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 207, 255, 0.15) 0%, transparent 70%)',
            top: '15px',
            left: '300px',
          }}
        />

        {/* Logo Icon */}
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '32px',
            background: 'linear-gradient(135deg, #00CFFF 0%, #0284C7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
            boxShadow: '0 0 50px rgba(0, 207, 255, 0.4)',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="75"
            height="75"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000000"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>

        {/* Platform Title */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 900,
            color: '#FFFFFF',
            marginBottom: '16px',
            textAlign: 'center',
            letterSpacing: '-1px',
          }}
        >
          منصة المهندس لتعليم الرياضيات
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#00CFFF',
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          مع م/ رضا خيرت — المرحلة الإعدادية والثانوية
        </div>

        {/* Features badge line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            fontSize: '20px',
            color: '#94A3B8',
            fontWeight: 600,
          }}
        >
          <span>شرح مبسط ووافٍ</span>
          <span>•</span>
          <span>بنك أسئلة شامل</span>
          <span>•</span>
          <span>اختبارات تفاعلية مستمرة</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
