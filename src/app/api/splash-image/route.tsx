import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          padding: '40px 20px',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            width: '180px',
            height: '180px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '30px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div
            style={{
              fontWeight: '900',
              fontSize: '72px',
            }}
          >
            BTB
          </div>
        </div>
        <div
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            marginBottom: '15px',
          }}
        >
          BTB Finance
        </div>
        <div
          style={{
            fontSize: '32px',
            opacity: '0.8',
          }}
        >
          Decentralized Finance Ecosystem
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
