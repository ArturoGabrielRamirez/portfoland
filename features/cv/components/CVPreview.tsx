/**
 * CVPreview Component
 *
 * Renders CVContent as styled HTML for on-screen preview.
 * Provides a clean, readable layout approximating the PDF output.
 */

'use client';

import { cn } from '@/lib/utils';
import type { CVContent } from '../types/cv';

interface CVPreviewProps {
  cvContent: CVContent;
  isTech: boolean;
  cardClassName: string;
}

export function CVPreview({ cvContent, isTech, cardClassName }: CVPreviewProps) {
  const sectionTitle = isTech
    ? 'text-sm font-mono font-bold uppercase tracking-widest mb-2'
    : 'text-base font-semibold mb-2';

  const sectionTitleColor = isTech ? 'text-[#00D4FF]' : 'text-gray-900';

  const bodyText = isTech
    ? 'text-sm font-mono text-gray-300 leading-relaxed'
    : 'text-sm text-gray-700 leading-relaxed';

  const divider = isTech
    ? 'border-t border-[hsl(174,100%,50%,0.15)] my-4'
    : 'border-t border-gray-200 my-4';

  return (
    <div
      className={cn(
        cardClassName,
        'p-6 max-h-[600px] overflow-y-auto',
      )}
    >
      {/* Professional Summary */}
      <section>
        <h3 className={cn(sectionTitle, sectionTitleColor)}>
          {isTech ? '> PROFESSIONAL_SUMMARY' : 'Professional Summary'}
        </h3>
        <p className={bodyText}>{cvContent.professionalSummary}</p>
      </section>

      <div className={divider} />

      {/* Skills */}
      {cvContent.skills.categories.length > 0 && (
        <>
          <section>
            <h3 className={cn(sectionTitle, sectionTitleColor)}>
              {isTech ? '> SKILLS' : 'Skills'}
            </h3>
            <div className="space-y-3">
              {cvContent.skills.categories.map((category) => (
                <div key={category.name}>
                  <p
                    className={cn(
                      'text-xs font-medium mb-1.5',
                      isTech ? 'font-mono text-gray-400' : 'text-gray-500',
                    )}
                  >
                    {category.name}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {category.skills.map((skill) => (
                      <span
                        key={skill.name}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded',
                          isTech
                            ? cn(
                                'font-mono border',
                                skill.validated
                                  ? 'bg-[hsl(150,100%,45%,0.1)] text-[hsl(150,100%,55%)] border-[hsl(150,100%,45%,0.3)]'
                                  : 'bg-[hsl(200,30%,12%)] text-gray-300 border-[hsl(174,100%,50%,0.15)]',
                              )
                            : cn(
                                'border',
                                skill.validated
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-gray-100 text-gray-600 border-gray-200',
                              ),
                        )}
                      >
                        {skill.name}
                        {skill.validated && (
                          <span className="text-[9px]" title="Validated">
                            {isTech ? '[V]' : '\u2713'}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <div className={divider} />
        </>
      )}

      {/* Work Experience */}
      {cvContent.workExperience.length > 0 && (
        <>
          <section>
            <h3 className={cn(sectionTitle, sectionTitleColor)}>
              {isTech ? '> WORK_EXPERIENCE' : 'Work Experience'}
            </h3>
            <div className="space-y-4">
              {cvContent.workExperience.map((exp, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        isTech ? 'font-mono text-gray-100' : 'text-gray-900',
                      )}
                    >
                      {exp.title}
                    </p>
                    <p
                      className={cn(
                        'text-[11px] shrink-0',
                        isTech ? 'font-mono text-gray-500' : 'text-gray-400',
                      )}
                    >
                      {exp.startDate} — {exp.endDate || 'Present'}
                    </p>
                  </div>
                  <p
                    className={cn(
                      'text-xs mb-1',
                      isTech ? 'font-mono text-[#00D4FF]/70' : 'text-blue-600',
                    )}
                  >
                    {exp.company}
                  </p>
                  <p className={bodyText}>{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
          <div className={divider} />
        </>
      )}

      {/* Projects */}
      {cvContent.projects.length > 0 && (
        <>
          <section>
            <h3 className={cn(sectionTitle, sectionTitleColor)}>
              {isTech ? '> PROJECTS' : 'Projects'}
            </h3>
            <div className="space-y-3">
              {cvContent.projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        isTech ? 'font-mono text-gray-100' : 'text-gray-900',
                      )}
                    >
                      {proj.title}
                    </p>
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded',
                        isTech
                          ? 'font-mono bg-[hsl(200,30%,12%)] text-gray-400'
                          : 'bg-gray-100 text-gray-500',
                      )}
                    >
                      {proj.status}
                    </span>
                  </div>
                  <p className={cn(bodyText, 'mt-0.5')}>{proj.description}</p>
                  {proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {proj.technologies.map((tech) => (
                        <span
                          key={tech}
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded',
                            isTech
                              ? 'font-mono bg-[hsl(174,100%,50%,0.08)] text-[#00D4FF]/80'
                              : 'bg-blue-50 text-blue-600',
                          )}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
          <div className={divider} />
        </>
      )}

      {/* Education */}
      {cvContent.education.length > 0 && (
        <>
          <section>
            <h3 className={cn(sectionTitle, sectionTitleColor)}>
              {isTech ? '> EDUCATION' : 'Education'}
            </h3>
            <div className="space-y-3">
              {cvContent.education.map((edu, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        isTech ? 'font-mono text-gray-100' : 'text-gray-900',
                      )}
                    >
                      {edu.title}
                    </p>
                    <p
                      className={cn(
                        'text-[11px] shrink-0',
                        isTech ? 'font-mono text-gray-500' : 'text-gray-400',
                      )}
                    >
                      {edu.startDate} — {edu.endDate || 'Present'}
                    </p>
                  </div>
                  <p
                    className={cn(
                      'text-xs mb-1',
                      isTech ? 'font-mono text-[#00D4FF]/70' : 'text-blue-600',
                    )}
                  >
                    {edu.company}
                  </p>
                  <p className={bodyText}>{edu.description}</p>
                </div>
              ))}
            </div>
          </section>
          <div className={divider} />
        </>
      )}

      {/* Certifications */}
      {cvContent.certifications.length > 0 && (
        <section>
          <h3 className={cn(sectionTitle, sectionTitleColor)}>
            {isTech ? '> CERTIFICATIONS' : 'Certifications'}
          </h3>
          <div className="space-y-3">
            {cvContent.certifications.map((cert, i) => (
              <div key={i}>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isTech ? 'font-mono text-gray-100' : 'text-gray-900',
                  )}
                >
                  {cert.title}
                </p>
                <p
                  className={cn(
                    'text-xs',
                    isTech ? 'font-mono text-[#00D4FF]/70' : 'text-blue-600',
                  )}
                >
                  {cert.company} — {cert.startDate}
                </p>
                <p className={bodyText}>{cert.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {cvContent.languages && cvContent.languages.length > 0 && (
        <>
          <div className={divider} />
          <section>
            <h3 className={cn(sectionTitle, sectionTitleColor)}>
              {isTech ? '> LANGUAGES' : 'Languages'}
            </h3>
            <p className={bodyText}>{cvContent.languages.join(', ')}</p>
          </section>
        </>
      )}
    </div>
  );
}
