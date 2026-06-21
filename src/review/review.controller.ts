import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/roles.decorator';

@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
  ) { }

  @Get('product/:itemNo')
  findByProduct(
    @Param('itemNo')
    itemNo: string,
  ) {
    return this.reviewService.findByProduct(
      itemNo,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser() user: Express.User,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.create(
      user.userId,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':itemNo')
  update(
    @CurrentUser() user: Express.User,
    @Param('itemNo')
    itemNo: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewService.update(
      user.userId,
      itemNo,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':itemNo')
  remove(
    @CurrentUser() user: Express.User,
    @Param('itemNo')
    itemNo: string,
  ) {
    return this.reviewService.remove(
      user.userId,
      itemNo,
    );
  }
} 