import { ComponentHarness } from '@angular/cdk/testing';

/**
 * A harness to test the `app-root` component through.
 */
export class RootHarness extends ComponentHarness {
    public static readonly hostSelector = 'app-root';

    private readonly getRouterOutlet = this.locatorForOptional('router-outlet');

    /**
     * Returns whether the root component renders the router outlet.
     */
    public async hasRouterOutlet(): Promise<boolean> {
        return (await this.getRouterOutlet()) !== null;
    }
}
