import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { AppComponent } from './app.component';
import { appConfig } from './app.config';

describe('AppComponent', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: appConfig.providers,
        });
    });

    it('renders the router outlet', async () => {
        const fixture = TestBed.createComponent(AppComponent);
        await fixture.whenStable();

        expect(fixture.debugElement.query(By.directive(RouterOutlet))).not.toBeNull();
    });
});
