import { Module } from '@nestjs/common';
import { SlugService } from './slug/slug.service.js';
import { appConfigProvider, STORE_CONFIG } from './config/app-config.provider.js';
import { feeCalculatorProvider, FEE_CALCULATOR } from './config/fee-calculator.provider.js';
import { RequestIdService } from './services/request-id.service.js';

@Module({
  providers: [
    SlugService,
    appConfigProvider,
    feeCalculatorProvider,
    RequestIdService,
  ],
  exports: [
    SlugService,
    STORE_CONFIG,
    FEE_CALCULATOR,
    RequestIdService,
  ],
})
export class SharedModule {}
