import { provideLocalization } from '@/localization';
import type { ComponentHarness, HarnessQuery } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/**
 * What `setupTestEnvironment` needs to render a component and reach it through its harness.
 *
 * @typeParam T The host component's class.
 * @typeParam H The harness the spec asserts through.
 */
interface SetupTestEnvironmentParams<T, H extends ComponentHarness> {
    /** A throwaway host component whose template renders the component under test. */
    testComponent: Type<T>;

    /** The harness class, or a `HarnessPredicate` narrowing it, that locates the component under test. */
    harness: HarnessQuery<H>;
}

/**
 * What `setupTestEnvironment` hands back to the spec.
 *
 * @typeParam H The harness the spec asserts through.
 */
interface SetupTestEnvironmentResult<H extends ComponentHarness> {
    /** The harness, loaded from the rendered host component. */
    harness: H;
}

/**
 * Configures the TestBed with the host component, renders it and loads the harness for the component under test.
 * Every component spec starts this way, so the steps live here once and a spec's own setup function reduces to
 * the arguments that make it specific. The application's texts are provided as well, so a spec reads the same words
 * a user does rather than the keys behind them.
 *
 * @typeParam T The host component's class.
 * @typeParam H The harness the spec asserts through.
 * @param params The host component to render and the harness to load from it.
 * @returns The loaded harness.
 */
export async function setupTestEnvironment<T, H extends ComponentHarness>(
    params: SetupTestEnvironmentParams<T, H>,
): Promise<SetupTestEnvironmentResult<H>> {
    TestBed.configureTestingModule({
        imports: [params.testComponent],
        providers: [provideLocalization()],
    });

    const harnessLoader = TestbedHarnessEnvironment.loader(TestBed.createComponent(params.testComponent));

    return {
        harness: await harnessLoader.getHarness(params.harness),
    };
}
