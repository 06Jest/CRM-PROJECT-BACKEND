import type { AnalyticsBreakdownDimension } from "../../types/analytics";

export interface AnalyticsDimensionDefinition {
  key: AnalyticsBreakdownDimension;
  label: string;
  leadColumn?: string;
  contactColumn?: string;
  description: string;
}

export const analyticsDimensions: AnalyticsDimensionDefinition[] = [
  {
    key: "industry",
    label: "Industry",
    leadColumn: "industry",
    contactColumn: "industry",
    description: "Group records by industry.",
  },
  {
    key: "source",
    label: "Source",
    leadColumn: "source",
    contactColumn: "source",
    description: "Group records by acquisition source.",
  },
  {
    key: "department",
    label: "Department",
    leadColumn: "department",
    contactColumn: "department",
    description: "Group records by department.",
  },
  {
    key: "position",
    label: "Position",
    leadColumn: "position",
    contactColumn: "position",
    description: "Group records by position.",
  },
  {
    key: "company",
    label: "Company",
    leadColumn: "company_name",
    contactColumn: "company_name",
    description: "Group records by company.",
  },
  {
    key: "priority",
    label: "Priority",
    leadColumn: "priority",
    contactColumn: "priority",
    description: "Group records by priority.",
  },
  {
    key: "status",
    label: "Status",
    leadColumn: "status",
    contactColumn: "status",
    description: "Group records by status.",
  },
  {
    key: "preferred_contact_time",
    label: "Preferred Contact Time",
    leadColumn: "preferred_contact_time",
    contactColumn: "preferred_contact_time",
    description: "Group records by preferred contact time.",
  },
  {
    key: "gender",
    label: "Gender",
    leadColumn: "gender",
    contactColumn: "gender",
    description: "Group records by gender.",
  },

  {
    key: "assigned_member",
    label: "Assigned Member",
    leadColumn: "assigned_to",
    contactColumn: "assigned_to",
    description: "Group records by assigned organization member.",
  },
];

export const getAnalyticsDimension = (
  dimension: AnalyticsBreakdownDimension,
): AnalyticsDimensionDefinition => {
  const definition = analyticsDimensions.find(
    (item) => item.key === dimension,
  );
  console.log("ANALYTICS DEFINITION:", definition);

  if (!definition) {
    throw new Error(
      `Unsupported analytics dimension: ${dimension}`,
    );
  }

  return definition;
};