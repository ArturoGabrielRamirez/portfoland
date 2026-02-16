
import { PortfolioData } from '../types/portfolio';

interface JsonLdProps {
    data: PortfolioData;
}

export function JsonLd({ data }: JsonLdProps) {
    const { user, skills } = data;
    const domain = 'portfoland.com';
    const url = `https://${user.username}.${domain}`;

    const personSchema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: user.name,
        url: url,
        image: user.image,
        description: user.bio,
        jobTitle: 'Professional',
        knowsAbout: skills?.skills.map((s) => ({
            '@type': 'Thing',
            name: s.skill.name,
        })) || [],
        // sameAs: [user.linkedin, user.github].filter(Boolean), // If we had these fields in user schema
    };

    // We could also add Occupation schema

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
    );
}
