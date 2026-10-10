import { appConfig } from '@/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { RootComponent } from './root.component';

describe('RootComponent', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RootComponent],
            providers: appConfig.providers,
        });
    });

    it('renders the router outlet', async () => {
        const fixture = TestBed.createComponent(RootComponent);
        await fixture.whenStable();

        expect(fixture.debugElement.query(By.directive(RouterOutlet))).not.toBeNull();
    });
});
