import { IsOptional, IsString, IsEnum, IsInt, Min } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(['PULSE', 'CORE'], { message: 'last_active_app must be either PULSE or CORE' })
  last_active_app?: string;

  @IsOptional()
  @IsString()
  preferred_mode?: string;
}

export class AddMinutesDto {
  @IsInt()
  @Min(1)
  minutes: number;
}
