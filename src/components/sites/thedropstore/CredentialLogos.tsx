import React from 'react';
import { siteData } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';

type Credential = (typeof siteData.about.credentials)[number];

/** Credentials that are both confirmed (`show`) and have a logo file. */
export const credentialsWithLogos = () => siteData.about.credentials.filter((c): c is Credential & { logo: string } => c.show && !!c.logo);

/**
 * One registration logo on its own tile: a light tile for logos drawn on white,
 * a black one for logos drawn on black (GeM), so neither looks pasted on.
 */
export function CredentialLogo({ credential, className, imgClassName }: { credential: Credential & { logo: string }; className?: string; imgClassName?: string }) {
  return (
    <span
      className={cn('flex items-center justify-center rounded-md', credential.dark ? 'bg-[#000]' : 'bg-[#fff]', className)}
      title={credential.description}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={credential.logo} alt={`${credential.title} logo`} loading="lazy" className={cn('max-h-full max-w-full object-contain', imgClassName)} />
    </span>
  );
}

/** A row of all registration logos, e.g. under the trust badges or in the footer. */
export function CredentialLogoStrip({ className, tileClassName }: { className?: string; tileClassName?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-3', className)}>
      {credentialsWithLogos().map((credential) => (
        <li key={credential.title}>
          <CredentialLogo credential={credential} className={cn('h-14 w-32 px-3 py-2', tileClassName)} />
        </li>
      ))}
    </ul>
  );
}
