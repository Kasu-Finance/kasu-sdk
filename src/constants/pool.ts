import {
  JuniorTrancheIcon,
  MezzanineTrancheIcon,
  SeniorTrancheIcon,
} from '@/assets/icons'

export enum Tranche {
  SENIOR = 'senior',
  JUNIOR = 'junior',
  MEZZANINE = 'mezzanine',
}

export const TRANCHE_ICONS = {
  senior: SeniorTrancheIcon(),
  mezzanine: MezzanineTrancheIcon(),
  junior: JuniorTrancheIcon(),
}
