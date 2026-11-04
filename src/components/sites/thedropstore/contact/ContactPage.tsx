'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useHeadingInTween } from '@/lib/dropstore/heading-tween';
import { siteData } from '@/lib/tranzlife-data';
import { cn } from '@/lib/utils';
import { PageLayout } from '../PageLayout';
import { Eyebrow, PageSection } from '../sections';
import { Text } from '../Text';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { useScreenTransition } from '../ScreenTransition';

/**
 * Enquiry form. There is no backend yet, so submitting opens the visitor's
 * email app with the enquiry addressed to info@tranzlife.in. Swap `submit`
 * for a form service or API route when one exists.
 */
function EnquiryForm() {
  const { contact, products } = siteData;
  const params = useSearchParams();
  const initialProduct = products.find((p) => p.slug === params.get('product'))?.title ?? '';
  const initialReason = contact.reasons.find((r) => r.value === params.get('reason'))?.value ?? contact.reasons[0].value;
  const [reason, setReason] = useState(initialReason);
  const [sent, setSent] = useState(false);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const reasonLabel = contact.reasons.find((r) => r.value === reason)?.label ?? reason;
    const optional = (label: string, key: string) => (data.get(key) ? [`${label}: ${data.get(key)}`] : []);
    const lines = [
      `Reason: ${reasonLabel}`,
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      ...optional('Phone', 'phone'),
      ...optional('Organisation', 'organisation'),
      ...optional('Product', 'product'),
      '',
      String(data.get('message') ?? ''),
    ];
    const subject = encodeURIComponent(`${reasonLabel} — ${data.get('name')}`);
    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${encodeURIComponent(lines.join('\n'))}`;
    setSent(true);
  };

  return (
    <form className="flex flex-col gap-10" onSubmit={submit}>
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-4">
          <Text variant="text-sm" className="uppercase tracking-[0.18em]">
            I am writing about
          </Text>
        </legend>
        <div className="flex flex-wrap gap-3">
          {contact.reasons.map((option) => (
            <label
              key={option.value}
              className={cn(
                'cursor-pointer rounded-full border px-5 py-3 transition-colors duration-300',
                reason === option.value ? 'bg-black text-white border-black' : 'border-gray-400 hover:border-black'
              )}
              data-pointer-chaser-size={0}
            >
              <input
                type="radio"
                name="reason"
                value={option.value}
                checked={reason === option.value}
                onChange={() => setReason(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
        <label className="flex flex-col">
          <span className="sr-only">Name</span>
          <input className="tl-field" name="name" placeholder="Your name *" required autoComplete="name" />
        </label>
        <label className="flex flex-col">
          <span className="sr-only">Email</span>
          <input className="tl-field" name="email" type="email" placeholder="Email *" required autoComplete="email" />
        </label>
        <label className="flex flex-col">
          <span className="sr-only">Phone</span>
          <input className="tl-field" name="phone" type="tel" placeholder="Phone" autoComplete="tel" />
        </label>
        <label className="flex flex-col">
          <span className="sr-only">{reason === 'product' ? 'Product' : 'Organisation'}</span>
          {reason === 'product' ? (
            <select className="tl-field" name="product" defaultValue={initialProduct}>
              <option value="">Which product? (optional)</option>
              {products.map((p) => (
                <option key={p.id} value={p.title}>
                  {p.title} — {p.subtitle}
                </option>
              ))}
            </select>
          ) : (
            <input className="tl-field" name="organisation" placeholder="Company or institution" autoComplete="organization" />
          )}
        </label>
        <label className="flex flex-col md:col-span-2">
          <span className="sr-only">Message</span>
          <textarea className="tl-field min-h-36 resize-y" name="message" placeholder="How can we help? *" required />
        </label>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <Button type="submit" className="w-fit">
          Send enquiry
        </Button>
        <Text variant="text-sm" className="text-gray-800 max-w-sm" aria-live="polite">
          {sent ? 'Your email app should now open with your enquiry. If it does not, write to us at ' + contact.email + '.' : 'Opens your email app, addressed to ' + contact.email + '.'}
        </Text>
      </div>
    </form>
  );
}

export function ContactPage() {
  const { contact, brand } = siteData;
  const heading = useHeadingInTween('h1', {}, { delay: 0.3 });

  useScreenTransition({
    leave(_, duration) {
      heading?.duration(duration / 2);
      heading?.reverse();
    },
  });

  return (
    <PageLayout pageNavigationProps={{ borderColor: 'var(--color-gray-300)', backgroundColor: 'var(--color-cream)' }}>
      <PageSection className="flex flex-col gap-8 pb-16" style={{ paddingTop: 'calc(var(--nav-space-top) + 4rem)' }}>
        <Eyebrow>Contact</Eyebrow>
        <Text tag="h1" variant="display-2" className="whitespace-pre-line" breakpoints={{ none: 'text-[3rem]' }}>
          {contact.title}
        </Text>
      </PageSection>
      <PageSection className="grid grid-cols-12 gap-x-6 gap-y-16 pb-24" data-loaded-in="-y" data-entered-in="-y" data-exiting="fade">
        <div className="col-span-full lg:col-span-7 flex flex-col gap-10">
          <Text variant="text-xl" className="max-w-xl">
            {contact.intro}
          </Text>
          <EnquiryForm />
        </div>
        <aside className="col-span-full lg:col-start-9 lg:col-span-4 flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <Text variant="text-sm" className="uppercase tracking-[0.18em] text-gray-800">
              Office
            </Text>
            <Text variant="text-lg">
              {brand.company}
              <br />
              {contact.address.map((line) => (
                <React.Fragment key={line}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </Text>
            <a href={contact.mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 underline underline-offset-4 w-fit">
              <Icon name="target" className="w-4 h-4 text-gold" />
              Open in Google Maps
            </a>
          </div>
          <ul className="flex flex-col border-t border-gray-300">
            <li className="border-b border-gray-300">
              <a className="flex justify-between items-center py-4" href={`mailto:${contact.email}`}>
                <span className="text-gray-800">Email</span>
                <span>{contact.email}</span>
              </a>
            </li>
            <li className="border-b border-gray-300">
              <a className="flex justify-between items-center py-4" href={`tel:${contact.phone.replace(/\s/g, '')}`}>
                <span className="text-gray-800">Phone</span>
                <span>{contact.phone}</span>
              </a>
            </li>
            <li className="border-b border-gray-300">
              <a className="flex justify-between items-center py-4" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">
                <span className="text-gray-800">WhatsApp</span>
                <span>Chat with us</span>
              </a>
            </li>
            <li className="border-b border-gray-300">
              <div className="flex justify-between items-center py-4">
                <span className="text-gray-800">Web</span>
                <span>{contact.website}</span>
              </div>
            </li>
          </ul>
          <div className="rounded-lg bg-black text-white p-6 flex flex-col gap-3">
            <Text variant="headline-4" className="!text-2xl">
              Distributors and retailers
            </Text>
            <Text variant="text-base" className="text-white/75">
              Choose “Distributor or retailer” above and tell us your region. We will share pricing, MOQ and our brochure.
            </Text>
          </div>
        </aside>
      </PageSection>
    </PageLayout>
  );
}
