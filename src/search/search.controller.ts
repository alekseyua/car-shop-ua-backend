import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/roles.decorator';
import { RequestSearchDto } from './dto/request-search.dto';
import { SearchResultResponse } from './dto/response-search.dto';
import { ParserService } from 'src/integrations/parser/parser.service';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly parserService: ParserService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  @ApiOkResponse({
    type: SearchResultResponse,
  })
  findAll(
    @Query() dto: RequestSearchDto,
    @CurrentUser() user: Express.User,
  ): Promise<SearchResultResponse> {
    console.log({ dto });
    const { page = 1, limit = 5, q } = dto;
    return this.searchService.findAll(user, q, page, limit);
  }

  @Get('kroon/search')
  kroonSearch(@Query('query') query: string) {
    if (!query?.trim()) {
      throw new Error('Query is required');
    }

    return this.parserService.kroonSmartSearch(query.trim());
  }

  @Get('kroon/product-recommendation')
  kroonProductRecommendation(@Query('url') url: string) {
    if (!url?.trim()) {
      throw new Error('URL is required');
    }

    return this.parserService.kroonProductRecommendation(url.trim());
  }
}
