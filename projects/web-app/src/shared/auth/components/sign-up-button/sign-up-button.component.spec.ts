import { SignUpButtonComponent } from '@/auth/components';
import { SignUpButtonHarness } from '@/auth/components/testing';
import { setupTestEnvironment } from '@/testing';
import { Component } from '@angular/core';

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
});
