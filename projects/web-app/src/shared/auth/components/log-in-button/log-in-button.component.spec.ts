import { LogInButtonComponent } from '@/auth/components';
import { LogInButtonHarness } from '@/auth/components/testing';
import { setupTestEnvironment } from '@/testing';
import { Component } from '@angular/core';

describe('LogInButtonComponent', () => {
    /** Hosts the component under test the way a page would, so the spec renders it through a template. */
    @Component({
        selector: 'app-test',
        template: `<app-log-in-button />`,
        imports: [LogInButtonComponent],
    })
    class TestComponent {}

    /**
     * Renders the host component and loads the harness a test asserts through.
     *
     * @returns The loaded harness.
     */
    async function setupTest() {
        const { harness } = await setupTestEnvironment({ testComponent: TestComponent, harness: LogInButtonHarness });

        return {
            harness: harness,
        };
    }

    it('should offer logging in', async () => {
        const { harness } = await setupTest();
        expect(await harness.label()).toEqual('Log in');
    });
});
