import { ShellTopBarComponent } from '@/core';
import { ShellTopBarHarness } from '@/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { setupTestEnvironment } from '@dnd-mapp/shared/testing';

describe('ShellTopBarComponent', () => {
    /** Hosts the component under test the way a page would, so the spec renders it through a template. */
    @Component({
        selector: 'app-test',
        template: `<app-shell-top-bar />`,
        imports: [ShellTopBarComponent],
    })
    class TestComponent {}

    /**
     * Renders the host component and loads the harness a test asserts through. The wordmark in the bar is a link, so
     * the router is provided; which page its path resolves to is the application's routing rather than the bar's, and
     * is covered by an end-to-end test.
     *
     * @returns The loaded harness.
     */
    async function setupTest() {
        const { harness } = await setupTestEnvironment({
            testComponent: TestComponent,
            harness: ShellTopBarHarness,
            providers: [provideRouter([])],
        });

        return {
            harness: harness,
        };
    }

    it('should render the shared top bar', async () => {
        const { harness } = await setupTest();
        expect(await harness.hasTopBar()).toBe(true);
    });

    it("should carry the application's name", async () => {
        const { harness } = await setupTest();
        expect(await harness.brandName()).toBe('D&D Mapp');
    });

    it('should offer logging in and signing up', async () => {
        const { harness } = await setupTest();
        expect(await harness.actionLabels()).toEqual(['Log in', 'Sign up']);
    });

    it('should lead with signing up', async () => {
        const { harness } = await setupTest();
        expect(await harness.actionVariants()).toEqual(['default', 'primary']);
    });
});
