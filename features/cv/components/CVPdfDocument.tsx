/**
 * CV PDF Document
 *
 * React-PDF template for rendering a CV as a downloadable PDF.
 * Uses @react-pdf/renderer for server-side PDF generation.
 *
 * Two templates:
 * - "professional": Full layout with all sections
 * - "minimal": Compact one-page layout
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { CVContent } from '../types/cv';

// =============================================================================
// Props
// =============================================================================

interface CVPdfDocumentProps {
  cvContent: CVContent;
  userName: string;
  userEmail: string;
  contactLinks?: Record<string, string>;
  template?: 'professional' | 'minimal';
}

// =============================================================================
// Styles
// =============================================================================

const colors = {
  primary: '#1a1a2e',
  secondary: '#333333',
  accent: '#2563eb',
  text: '#1f2937',
  lightText: '#6b7280',
  border: '#e5e7eb',
  background: '#ffffff',
  chipBg: '#f3f4f6',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    color: colors.text,
    backgroundColor: colors.background,
  },
  // Header
  header: {
    marginBottom: 20,
    borderBottom: `2px solid ${colors.primary}`,
    paddingBottom: 12,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contactItem: {
    fontSize: 9,
    color: colors.lightText,
  },
  // Section
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    marginBottom: 8,
    paddingBottom: 3,
    borderBottom: `1px solid ${colors.border}`,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Summary
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.secondary,
  },
  // Skills
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  categoryGroup: {
    marginBottom: 6,
    width: '100%',
  },
  categoryName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.accent,
    marginBottom: 3,
  },
  skillChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  skillChip: {
    fontSize: 8,
    backgroundColor: colors.chipBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    color: colors.text,
  },
  skillChipValidated: {
    fontSize: 8,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    color: colors.accent,
    fontFamily: 'Helvetica-Bold',
  },
  // Experience Entry
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: colors.text,
  },
  entryDate: {
    fontSize: 9,
    color: colors.lightText,
  },
  entryCompany: {
    fontSize: 10,
    color: colors.accent,
    marginBottom: 3,
  },
  entryDescription: {
    fontSize: 9,
    lineHeight: 1.4,
    color: colors.secondary,
    marginBottom: 8,
  },
  // Projects
  projectTech: {
    fontSize: 8,
    color: colors.lightText,
    marginBottom: 2,
  },
  projectLinks: {
    fontSize: 8,
    color: colors.accent,
    marginBottom: 6,
  },
  // Minimal template overrides
  minimalPage: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    padding: 30,
    color: colors.text,
    backgroundColor: colors.background,
  },
  minimalName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    marginBottom: 2,
  },
  minimalSection: {
    marginBottom: 8,
  },
  minimalSectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    marginBottom: 4,
    borderBottom: `0.5px solid ${colors.border}`,
    paddingBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  minimalSummary: {
    fontSize: 8,
    lineHeight: 1.4,
    color: colors.secondary,
  },
  minimalEntryDescription: {
    fontSize: 8,
    lineHeight: 1.3,
    color: colors.secondary,
    marginBottom: 4,
  },
});

// =============================================================================
// Helper: Format Date for Display
// =============================================================================

function formatDisplayDate(dateStr: string | null): string {
  if (!dateStr) return 'Present';

  try {
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// =============================================================================
// Professional Template
// =============================================================================

function ProfessionalTemplate({
  cvContent,
  userName,
  userEmail,
  contactLinks,
}: CVPdfDocumentProps) {
  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{userName}</Text>
        <View style={styles.contactRow}>
          <Text style={styles.contactItem}>{userEmail}</Text>
          {contactLinks && Object.entries(contactLinks).map(([key, value]) => (
            value ? (
              <Text key={key} style={styles.contactItem}>
                | {value}
              </Text>
            ) : null
          ))}
        </View>
      </View>

      {/* Professional Summary */}
      {cvContent.professionalSummary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.summary}>{cvContent.professionalSummary}</Text>
        </View>
      )}

      {/* Skills */}
      {cvContent.skills.categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Skills</Text>
          {cvContent.skills.categories.map((category) => (
            <View key={category.name} style={styles.categoryGroup}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <View style={styles.skillChips}>
                {category.skills.map((skill) => (
                  <Text
                    key={skill.name}
                    style={skill.validated ? styles.skillChipValidated : styles.skillChip}
                  >
                    {skill.name}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Work Experience */}
      {cvContent.workExperience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Experience</Text>
          {cvContent.workExperience.map((exp, i) => (
            <View key={`work-${i}`}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{exp.title}</Text>
                <Text style={styles.entryDate}>
                  {formatDisplayDate(exp.startDate)} — {formatDisplayDate(exp.endDate)}
                </Text>
              </View>
              <Text style={styles.entryCompany}>{exp.company}</Text>
              <Text style={styles.entryDescription}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Projects */}
      {cvContent.projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {cvContent.projects.map((proj, i) => (
            <View key={`proj-${i}`}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{proj.title}</Text>
                <Text style={styles.entryDate}>{proj.status}</Text>
              </View>
              <Text style={styles.entryDescription}>{proj.description}</Text>
              {proj.technologies.length > 0 && (
                <Text style={styles.projectTech}>
                  Technologies: {proj.technologies.join(', ')}
                </Text>
              )}
              {proj.links.length > 0 && (
                <Text style={styles.projectLinks}>
                  {proj.links.map(l => `${l.label}: ${l.url}`).join(' | ')}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {cvContent.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {cvContent.education.map((edu, i) => (
            <View key={`edu-${i}`}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{edu.title}</Text>
                <Text style={styles.entryDate}>
                  {formatDisplayDate(edu.startDate)} — {formatDisplayDate(edu.endDate)}
                </Text>
              </View>
              <Text style={styles.entryCompany}>{edu.company}</Text>
              <Text style={styles.entryDescription}>{edu.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Certifications */}
      {cvContent.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {cvContent.certifications.map((cert, i) => (
            <View key={`cert-${i}`}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{cert.title}</Text>
                <Text style={styles.entryDate}>{formatDisplayDate(cert.startDate)}</Text>
              </View>
              <Text style={styles.entryCompany}>{cert.company}</Text>
              {cert.description && (
                <Text style={styles.entryDescription}>{cert.description}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Languages */}
      {cvContent.languages && cvContent.languages.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <Text style={styles.summary}>{cvContent.languages.join(' | ')}</Text>
        </View>
      )}
    </Page>
  );
}

// =============================================================================
// Minimal Template
// =============================================================================

function MinimalTemplate({
  cvContent,
  userName,
  userEmail,
  contactLinks,
}: CVPdfDocumentProps) {
  return (
    <Page size="A4" style={styles.minimalPage}>
      {/* Header */}
      <View style={{ marginBottom: 12, borderBottom: `1px solid ${colors.primary}`, paddingBottom: 6 }}>
        <Text style={styles.minimalName}>{userName}</Text>
        <View style={styles.contactRow}>
          <Text style={styles.contactItem}>{userEmail}</Text>
          {contactLinks && Object.entries(contactLinks).map(([key, value]) => (
            value ? (
              <Text key={key} style={styles.contactItem}>| {value}</Text>
            ) : null
          ))}
        </View>
      </View>

      {/* Summary */}
      {cvContent.professionalSummary && (
        <View style={styles.minimalSection}>
          <Text style={styles.minimalSectionTitle}>Summary</Text>
          <Text style={styles.minimalSummary}>{cvContent.professionalSummary}</Text>
        </View>
      )}

      {/* Skills (inline, no categories) */}
      {cvContent.skills.categories.length > 0 && (
        <View style={styles.minimalSection}>
          <Text style={styles.minimalSectionTitle}>Skills</Text>
          <View style={styles.skillChips}>
            {cvContent.skills.categories.flatMap(cat => cat.skills).map((skill) => (
              <Text key={skill.name} style={styles.skillChip}>
                {skill.name}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Work Experience */}
      {cvContent.workExperience.length > 0 && (
        <View style={styles.minimalSection}>
          <Text style={styles.minimalSectionTitle}>Experience</Text>
          {cvContent.workExperience.map((exp, i) => (
            <View key={`work-${i}`}>
              <View style={styles.entryHeader}>
                <Text style={{ ...styles.entryTitle, fontSize: 9 }}>
                  {exp.title} — {exp.company}
                </Text>
                <Text style={styles.entryDate}>
                  {formatDisplayDate(exp.startDate)} — {formatDisplayDate(exp.endDate)}
                </Text>
              </View>
              <Text style={styles.minimalEntryDescription}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Projects (compact) */}
      {cvContent.projects.length > 0 && (
        <View style={styles.minimalSection}>
          <Text style={styles.minimalSectionTitle}>Projects</Text>
          {cvContent.projects.slice(0, 3).map((proj, i) => (
            <View key={`proj-${i}`}>
              <Text style={{ ...styles.entryTitle, fontSize: 9 }}>{proj.title}</Text>
              <Text style={styles.minimalEntryDescription}>
                {proj.description} | {proj.technologies.join(', ')}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {cvContent.education.length > 0 && (
        <View style={styles.minimalSection}>
          <Text style={styles.minimalSectionTitle}>Education</Text>
          {cvContent.education.map((edu, i) => (
            <View key={`edu-${i}`} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text style={{ fontSize: 9 }}>
                {edu.title} — {edu.company}
              </Text>
              <Text style={styles.entryDate}>
                {formatDisplayDate(edu.startDate)} — {formatDisplayDate(edu.endDate)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Certifications */}
      {cvContent.certifications.length > 0 && (
        <View style={styles.minimalSection}>
          <Text style={styles.minimalSectionTitle}>Certifications</Text>
          {cvContent.certifications.map((cert, i) => (
            <Text key={`cert-${i}`} style={{ fontSize: 8, marginBottom: 2 }}>
              {cert.title} — {cert.company} ({formatDisplayDate(cert.startDate)})
            </Text>
          ))}
        </View>
      )}
    </Page>
  );
}

// =============================================================================
// Document Component
// =============================================================================

export function CVPdfDocument(props: CVPdfDocumentProps) {
  const { template = 'professional' } = props;

  return (
    <Document>
      {template === 'minimal'
        ? <MinimalTemplate {...props} />
        : <ProfessionalTemplate {...props} />
      }
    </Document>
  );
}
