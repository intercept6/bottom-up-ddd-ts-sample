export class ListUserCommand {
  private readonly limit?: number;
  private readonly nextToken?: string;

  constructor(props?: { nextToken?: string; limit?: number }) {
    this.limit = props?.limit;
    this.nextToken = props?.nextToken;
  }

  getLimit(): number | undefined {
    return this.limit;
  }

  getNextToken(): string | undefined {
    return this.nextToken;
  }
}
