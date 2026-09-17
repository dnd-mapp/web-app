import { Component } from '@angular/core';
import { SignUpButtonComponent } from '@dnd-mapp/auth/components';
import { SignUpButtonHarness } from '@dnd-mapp/auth/components/testing';
import { setupTestEnvironment } from '@dnd-mapp/shared/testing';

describe('SignUpButtonComponent', () => {
    /** Hosts the component under test the way a page would, so the spec renders it through a template. */
    @Component({
        selector: 'app-test',
        template: `<app-sign-up-button />`,
        imports: [SignUpButtonComponent],
    })
    class TestComponent {}

    /**
     * Renders the host component and loads the harness a test asserts through.
     *
     * @returns The loaded harness.
     */
    async function setupTest() {
        const { harness } = await setupTestEnvironment({ testComponent: TestComponent, harness: SignUpButtonHarness });

        return {
            harness: harness,
        };
    }

    it('should offer signing up', async () => {
        const { harness } = await setupTest();
        expect(await harness.label()).toEqual('Sign up');
    });

    it('should render as the primary action', async () => {
        const { harness } = await setupTest();
        expect(await harness.variant()).toEqual('primary');
    });
});
