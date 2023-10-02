import type { TenantDocument } from "@/modules/tenants/model";

export const tenants: TenantDocument[] = [
  {
    _id: '6514759bf072bbc021070ddb',
    name: 'ROOT',
    email: 'root@testbank.dev',
    createdAt: new Date('2023-06-24T09:00:00.000Z'),
    updatedAt: new Date('2023-06-24T09:00:00.000Z'),
  },
  {
    _id: '6514761a1c11e43d29f1e314',
    name: 'LENDER',
    email: 'lender@testbank.dev',
    createdAt: new Date('2023-06-24T10:00:00.000Z'),
    updatedAt: new Date('2023-06-24T10:00:00.000Z'),
  },
  {
    _id: '65148cd8e32904af1582bb14',
    name: 'jdrydn',
    email: 'james@jdrydn.com',
    createdAt: new Date('2023-06-25T10:00:00.000Z'),
    updatedAt: new Date('2023-06-25T10:00:00.000Z'),
  },
  {
    _id: '65148ce3536604cffa4e3932',
    name: 'Starship Enterprises',
    email: 'starship@someimportantcompany.com',
    createdAt: new Date('2023-06-25T11:00:00.000Z'),
    updatedAt: new Date('2023-06-25T11:00:00.000Z'),
  },
];
