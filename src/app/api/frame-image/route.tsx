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
            width: '120px',
            height: '120px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontWeight: '900',
              fontSize: '36px',
            }}
          >
            BTB
          </div>
        </div>
        <div
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '10px',
          }}
        >
          BTB Finance
        </div>
        <div
          style={{
            fontSize: '24px',
            opacity: '0.8',
          }}
        >
          Decentralized Finance Ecosystem
        </div>
      </div>
    ),
    {
      width: 600,
      height: 400,
    },
  );
}
