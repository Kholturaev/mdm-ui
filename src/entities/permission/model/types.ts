/**
 * Shape of the REAL backend's `/permission/list`, `/permission/me/permissions`,
 * and `/permission/role-default-permissions` responses — permissions grouped
 * by backend module (`nameEndpoint`), each with a human-readable `name` and
 * the opaque `value` sent back to the server.
 */
export interface IMyPermissionItem {
  name: string;
  value: string;
}

export interface IMyPermissionGroup {
  nameEndpoint: string;
  permissions: IMyPermissionItem[];
}
