import { Module, Global } from '@nestjs/common';
import { JiJiaApiService } from './ji-jia-api.service';

@Global()
@Module({
  providers: [JiJiaApiService],
  exports: [JiJiaApiService],
})
export class CommonModule {}
