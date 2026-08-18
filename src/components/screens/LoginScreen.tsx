import React from 'react';
import { ArrowRight, Sparkles, UserCheck } from 'lucide-react';

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
        background: '#24405c',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 26px 44px',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Decorative Barb Pink & Steel Orbs */}
      <div
        className="animate-orb-1"
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-60px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: '#f5265f',
          filter: 'drop-shadow(0 10px 30px rgba(245, 38, 95, 0.35))',
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
          background: '#ffd4de',
          opacity: 0.9,
          filter: 'drop-shadow(0 10px 30px rgba(255, 212, 222, 0.25))',
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
          background: '#a9c8e6',
          opacity: 0.9,
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
            background: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(10px)',
            color: '#ffd4de',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '16px',
          }}
        >
          <Sparkles size={13} color="#f5265f" /> 30 Crawled Masters in Kyiv
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
          Barb
        </h1>

        <p
          style={{
            marginTop: '14px',
            fontSize: '17px',
            lineHeight: 1.45,
            color: 'rgba(255, 255, 255, 0.82)',
            maxWidth: '290px',
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
              background: '#f5265f',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 20px rgba(245, 38, 95, 0.38)',
              transition: 'all 0.15s ease',
            }}
          >
            Continue with phone
          </button>

          <button
            onClick={onExploreMap}
            style={{
              height: '54px',
              borderRadius: '27px',
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#24405c',
              border: 'none',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>Explore Kyiv Map</span>
            <ArrowRight size={16} />
          </button>

          <button
            onClick={onSignInMaster}
            style={{
              height: '46px',
              borderRadius: '23px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '4px',
            }}
          >
            <UserCheck size={14} color="#ffd4de" />
            <span>Master Sign In (Portal)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
