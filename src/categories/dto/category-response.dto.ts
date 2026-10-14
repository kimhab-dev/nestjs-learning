import { Expose } from "class-transformer";

export class CategoryResponseDto {
    @Expose() id: number;
    @Expose() name: string;
    @Expose() description: string;
    @Expose() created_at: Date;
}