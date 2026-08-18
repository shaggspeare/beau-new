import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onSignIn: () => void;
  onExploreMap: () => void;
  onSignInMaster: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSignIn,
  onExploreMap,
  onSignInMaster,
}) => {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        background: '#1a1938',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 26px 44px',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Decorative Orbs */}
      <div
        className="animate-orb-1"
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-60px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: '#d9f24e',
          filter: 'drop-shadow(0 10px 30px rgba(217, 242, 78, 0.3))',
        }}
      />
      <div
        className="animate-orb-2"
        style={{
          position: 'absolute',
          top: '150px',
          left: '-90px',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: '#9a86f5',
          opacity: 0.9,
          filter: 'drop-shadow(0 10px 30px rgba(154, 134, 245, 0.3))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '290px',
          right: '40px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: '#f4938e',
          opacity: 0.95,
        }}
      />

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(10px)',
            color: '#d9f24e',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '16px',
          }}
        >
          <Sparkles size={13} /> 30 Crawled Masters in Kyiv
        </div>

        {/* Big Title */}
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '58px',
            lineHeight: 1,
            color: '#ffffff',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          Beau
        </h1>

        <p
          style={{
            marginTop: '14px',
            fontSize: '17px',
            lineHeight: 1.45,
            color: 'rgba(255, 255, 255, 0.76)',
            maxWidth: '280px',
          }}
        >
          Beauty specialists near you — on the map, booked in a tap.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '28px' }}>
          <button
            onClick={onSignIn}
            style={{
              height: '54px',
              border: 'none',
              borderRadius: '27px',
              background: '#d9f24e',
              color: '#1a1938',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 20px rgba(217, 242, 78, 0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            Continue with phone
          </button>

          <button
            onClick={onExploreMap}
            style={{
              height: '54px',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              borderRadius: '27px',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            Explore Map (30 Masters) <ArrowRight size={16} />
          </button>

          <button
            onClick={onSignInMaster}
            style={{
              height: '40px',
              border: 'none',
              background: 'none',
              color: 'rgba(255, 255, 255, 0.65)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              marginTop: '4px',
              transition: 'color 0.15s ease',
            }}
          >
            I'm a beauty master →
          </button>
        </div>
      </div>
    </div>
  );
};
