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
          backgroundColor: '#1e3a8a',
          padding: '40px 20px',
          color: 'white',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-50px',
            right: '-50px',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
        
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            marginBottom: '20px',
            background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          BTB Finance
        </div>
        
        <div
          style={{
            fontSize: '32px',
            fontWeight: '500',
            marginBottom: '40px',
            opacity: '0.9',
          }}
        >
          Decentralized Finance Ecosystem
        </div>
        
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px 30px',
              textAlign: 'center',
              width: '180px',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎯</div>
            <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '5px' }}>Mega Pot</div>
            <div style={{ fontSize: '16px', opacity: '0.8' }}>Win big with BTB</div>
          </div>
          
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px 30px',
              textAlign: 'center',
              width: '180px',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🐥</div>
            <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '5px' }}>Chicks</div>
            <div style={{ fontSize: '16px', opacity: '0.8' }}>Trade & earn</div>
          </div>
          
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '20px 30px',
              textAlign: 'center',
              width: '180px',
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🖼️</div>
            <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '5px' }}>NFTs</div>
            <div style={{ fontSize: '16px', opacity: '0.8' }}>Exclusive collection</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
