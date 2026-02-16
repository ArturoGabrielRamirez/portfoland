
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { getPortfolioByUsername } from '@/features/portfolio/data/getPortfolio.data';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');
        const modeOverride = searchParams.get('mode');
        const locale = searchParams.get('locale') || 'en';

        if (!username) {
            return new Response('Username is required', { status: 400 });
        }

        const portfolio = await getPortfolioByUsername(username);

        if (!portfolio || !portfolio.user) {
            return new Response('User not found', { status: 404 });
        }

        const { user, skills } = portfolio;
        const mode = modeOverride || user.portfolioMode || 'professional';
        const isGaming = mode === 'gaming';
        const userTitle = isGaming ? 'Player' : 'Professional';

        // Font loading - using standard fetch for Google Fonts
        const interSemiBold = await fetch(
            new URL('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZs.woff', import.meta.url)
        ).then((res) => res.arrayBuffer());

        const gamingFont = await fetch(
            new URL('https://fonts.gstatic.com/s/vt323/v17/pxiKyp0ihIEF2isF53lGgrQ5b7UB.woff', import.meta.url)
        ).then((res) => res.arrayBuffer());

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isGaming ? '#0A0E1A' : '#F8FAFC',
                        backgroundImage: isGaming
                            ? 'radial-gradient(circle at 25% 25%, #1a1f2e 0%, #0A0E1A 50%)'
                            : 'radial-gradient(circle at 25% 25%, #ffffff 0%, #f1f5f9 100%)',
                        fontFamily: isGaming ? '"GamingFont"' : '"Inter"',
                    }}
                >
                    {isGaming ? (
                        // GAMING TEMPLATE
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                width: '90%',
                                height: '80%',
                                border: '2px solid #00D4FF',
                                borderRadius: '16px',
                                padding: '40px',
                                background: 'rgba(0, 20, 40, 0.7)',
                                boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                                color: '#E2E8F0',
                                alignItems: 'center',
                            }}
                        >
                            {/* Avatar Ring */}
                            <div style={{ display: 'flex', position: 'relative', marginRight: '40px' }}>
                                <div style={{
                                    position: 'absolute',
                                    inset: '-4px',
                                    borderRadius: '100px',
                                    border: '4px solid #D946EF',
                                    boxShadow: '0 0 15px #D946EF',
                                }} />
                                <img
                                    src={user.image || 'https://github.com/shadcn.png'}
                                    width="150"
                                    height="150"
                                    style={{ borderRadius: '100px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <div style={{
                                    fontSize: 24,
                                    color: '#00D4FF',
                                    marginBottom: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px'
                                }}>
                                    Player Profile
                                </div>
                                <div style={{ fontSize: 60, fontWeight: 'bold', color: 'white', lineHeight: 1 }}>
                                    {user.name}
                                </div>
                                <div style={{ fontSize: 30, color: '#94A3B8', marginTop: '10px' }}>
                                    Level {skills && skills.skills ? skills.skills.length > 5 ? Math.floor(skills.skills.length * 1.5) : 1 : 1} {userTitle}
                                </div>

                                {/* Stats / Skills */}
                                <div style={{ display: 'flex', marginTop: '30px', gap: '10px' }}>
                                    {skills && skills.skills && skills.skills.slice(0, 3).map((s: any, i: number) => (
                                        <div key={i} style={{
                                            padding: '8px 16px',
                                            borderRadius: '4px',
                                            border: '1px solid #00D4FF',
                                            color: '#00D4FF',
                                            fontSize: 18,
                                            backgroundColor: 'rgba(0, 212, 255, 0.1)'
                                        }}>
                                            {s.skill.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // PROFESSIONAL TEMPLATE
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%',
                                padding: '40px',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: 'white',
                                    padding: '40px 60px',
                                    borderRadius: '24px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                                    gap: '40px',
                                }}
                            >
                                <img
                                    src={user.image || 'https://github.com/shadcn.png'}
                                    width="160"
                                    height="160"
                                    style={{ borderRadius: '100px', objectFit: 'cover' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontSize: 52, fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
                                        {user.name}
                                    </div>
                                    <div style={{ fontSize: 28, color: '#64748B', marginTop: '8px', fontWeight: 500 }}>
                                        {userTitle}
                                    </div>
                                    <div style={{ display: 'flex', marginTop: '24px', gap: '12px' }}>
                                        {skills && skills.skills && skills.skills.slice(0, 3).map((s: any, i: number) => (
                                            <div key={i} style={{
                                                padding: '6px 16px',
                                                borderRadius: '100px',
                                                background: '#F1F5F9',
                                                color: '#475569',
                                                fontSize: 18,
                                                fontWeight: 600
                                            }}>
                                                {s.skill.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div style={{ position: 'absolute', bottom: 40, color: '#94A3B8', fontSize: 20, fontWeight: 500 }}>
                                portfoland.com/{user.username}
                            </div>
                        </div>
                    )}
                </div>
            ),
            {
                width: 1200,
                height: 630,
                fonts: [
                    {
                        name: 'Inter',
                        data: interSemiBold,
                        style: 'normal',
                        weight: 600,
                    },
                    {
                        name: 'GamingFont',
                        data: gamingFont,
                        style: 'normal',
                        weight: 400,
                    }
                ],
            }
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
