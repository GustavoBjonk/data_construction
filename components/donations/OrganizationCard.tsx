import { Organization } from "@/data/donations";
import { Button } from "@/components/ui/Button";

interface OrganizationCardProps {
  organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  return (
    <article className="card-interactive flex h-full flex-col p-6">
      <p className="eyebrow text-accent">{organization.category}</p>
      <h3 className="mt-4 font-display text-xl font-medium leading-snug tracking-tight text-fg">{organization.name}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{organization.description}</p>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
        <Button href={organization.donationUrl} external withArrow size="sm">
          Doar
        </Button>
        <Button href={organization.officialSiteUrl} external variant="secondary" size="sm">
          Site oficial
        </Button>
      </div>
    </article>
  );
}
