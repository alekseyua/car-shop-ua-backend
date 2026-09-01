import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/roles.decorator';
import { RequestSearchDto } from './dto/request-search.dto';
import { SearchResultResponse } from './dto/response-search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
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
}
