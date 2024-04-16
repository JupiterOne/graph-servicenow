import { IntegrationInstanceConfig } from '@jupiterone/integration-sdk-core';

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
export interface IntegrationConfig extends IntegrationInstanceConfig {
  /**
   * Hostname for ServiceNow implementation, e.g. dev94579.service-now.com
   */
  hostname: string;
  /**
   * Parent of all the sys_class_name to ingest
   */
  cmdb_parent: string | undefined;
  /**
   * Username for basic auth
   */
  username: string;
  /**
   * Password for basic auth
   */
  password: string;
}
export type CMDBItem = {
  attested_date: string;
  skip_sync: string;
  operational_status: string;
  sys_updated_on: Date;
  attestation_score: string;
  discovery_source: string;
  first_discovered: string;
  sys_updated_by: string;
  due_in: string;
  sys_created_on: Date;
  sys_domain: Asset | undefined;
  install_date: Date;
  gl_account: string;
  invoice_number: string;
  sys_created_by: string;
  warranty_expiration: string;
  asset_tag: string;
  fqdn: string;
  change_control: string;
  owned_by: Asset | undefined;
  checked_out: string;
  sys_domain_path: string;
  business_unit: string;
  delivery_date: string;
  maintenance_schedule: string;
  install_status: string;
  cost_center: Asset | undefined;
  attested_by: string;
  supported_by: string;
  dns_domain: string;
  name: string;
  assigned: Date;
  life_cycle_stage: string;
  purchase_date: string;
  subcategory: string;
  short_description: string;
  assignment_group: string;
  managed_by: Asset | undefined;
  managed_by_group: Asset | undefined;
  can_print: string;
  last_discovered: string;
  sys_class_name: string;
  manufacturer: Asset | undefined;
  sys_id: string;
  po_number: string;
  checked_in: string;
  sys_class_path: string;
  life_cycle_stage_status: string;
  mac_address: string;
  vendor: Asset | undefined;
  company: Asset | undefined;
  justification: string;
  model_number: string;
  department: Asset | undefined;
  assigned_to: Asset | undefined;
  start_date: string;
  comments: string;
  cost: string;
  attestation_status: string;
  sys_mod_count: string;
  monitor: string;
  serial_number: string;
  ip_address: string;
  model_id: Asset | undefined;
  duplicate_of: string;
  sys_tags: string;
  cost_cc: string;
  order_date: string;
  schedule: string;
  support_group: string;
  environment: string;
  due: string;
  attested: string;
  correlation_id: string;
  unverified: string;
  attributes: string;
  location: Asset | undefined;
  asset: Asset | undefined;
  category: string;
  fault_count: string;
  lease_id: string;
};

export type Asset = {
  link: string;
  value: string;
};
export type DictionaryItem = {
  super_class: Asset | undefined;
  name: string;
};

export interface PaginatedResponse<T> {
  result: T[];
  nextLink?: string;
}

export interface ServiceNowBase {
  sys_id: string;
  sys_created_on: string;
  sys_updated_on: string;
}

export interface ServiceNowLink {
  link: string;
  value: string;
}

export enum ServiceNowActiveEnum {
  TRUE = 'true',
  FALSE = 'false',
}

export interface ServiceNowUser extends ServiceNowBase {
  name: string;
  user_name: string;
  active: ServiceNowActiveEnum;
  email: string;
  user_password?: string;
}

export interface ServiceNowGroup extends ServiceNowBase {
  name: string;
  active: ServiceNowActiveEnum;
  email: string;
  parent: ServiceNowLink;
}

export interface ServiceNowIncident extends ServiceNowBase {
  number: string;
  severity: string;
  category: string;
  opened_by: ServiceNowLink;
  impact: number;
  resolved_at: string;
  active: ServiceNowActiveEnum;
  assigned_to: ServiceNowLink;
}

export interface ServiceNowGroupMember extends ServiceNowBase {
  group: ServiceNowLink;
  user: ServiceNowLink;
}

export interface ServiceNowDatabaseTable extends ServiceNowBase {
  name: string;
  super_class: ServiceNowLink;
}
