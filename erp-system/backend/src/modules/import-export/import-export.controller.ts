import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ImportExportService, ImportRow } from './import-export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('import-export')
@UseGuards(JwtAuthGuard)
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Get('export/products')
  async exportProducts() {
    return this.importExportService.exportProducts();
  }

  @Get('export/suppliers')
  async exportSuppliers() {
    return this.importExportService.exportSuppliers();
  }

  @Get('export/customers')
  async exportCustomers() {
    return this.importExportService.exportCustomers();
  }

  @Post('import/products')
  async importProducts(@Body() data: ImportRow[]) {
    return this.importExportService.importProducts(data);
  }

  @Post('import/suppliers')
  async importSuppliers(@Body() data: ImportRow[]) {
    return this.importExportService.importSuppliers(data);
  }

  @Post('import/customers')
  async importCustomers(@Body() data: ImportRow[]) {
    return this.importExportService.importCustomers(data);
  }
}
