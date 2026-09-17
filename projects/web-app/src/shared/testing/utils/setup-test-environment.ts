import type { ComponentHarness, HarnessQuery } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';

interface SetupTestEnvironmentParams<T, H extends ComponentHarness> {
    testComponent: Type<T>;

    harness: HarnessQuery<H>;
}

interface SetupTestEnvironmentResult<H extends ComponentHarness> {
    harness: H;
}

export async function setupTestEnvironment<T, H extends ComponentHarness>(
    params: SetupTestEnvironmentParams<T, H>,
): Promise<SetupTestEnvironmentResult<H>> {
    TestBed.configureTestingModule({
        imports: [params.testComponent],
    });

    const harnessLoader = TestbedHarnessEnvironment.loader(TestBed.createComponent(params.testComponent));

    return {
        harness: await harnessLoader.getHarness(params.harness),
    };
}
