import { UsersResponseDto } from "src/users/dto/user-response.dto";

export class OrderResponseDto {
    id: number;
    productId: number;
    total: number;
    user: UsersResponseDto
}