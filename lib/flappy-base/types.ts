import { NextResponse } from "next/server";

export interface UserHearts {
  hearts: number;
}

export interface UserHeartsResponse extends NextResponse<Body> {
  payload: UserHearts;
}
