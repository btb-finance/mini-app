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
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background elements */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
        
        {/* Logo */}
        <div
          style={{
            width: '120px',
            height: '120px',
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
              fontSize: '48px',
            }}
          >
            BTB
          </div>
        </div>
        
        {/* Title */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          BTB Finance
        </div>
        
        {/* Subtitle */}
        <div
          style={{
            fontSize: '32px',
            opacity: '0.8',
            marginBottom: '40px',
            textAlign: 'center',
          }}
        >
          Decentralized Finance Ecosystem
        </div>
        
        {/* Features */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              width: '150px',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎯</div>
            <div style={{ fontSize: '20px', fontWeight: '600' }}>Mega Pot</div>
          </div>
          
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              width: '150px',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🐥</div>
            <div style={{ fontSize: '20px', fontWeight: '600' }}>Chicks</div>
          </div>
          
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              width: '150px',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🖼️</div>
            <div style={{ fontSize: '20px', fontWeight: '600' }}>NFTs</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 800, // 3:2 aspect ratio as recommended
    },
  );
}
