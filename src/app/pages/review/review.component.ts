import { afterNextRender, Component, DestroyRef, Inject, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { Navigation, Router } from '@angular/router';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review.component.html',
  styleUrl: './review.component.css',
})
export class ReviewComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  public currentRoute: Navigation | null = null;
  public questions!: Record<string, unknown>[];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private readonly router: Router,
    private readonly location: Location,
  ) {
    this.currentRoute = this.router.getCurrentNavigation();
    // to run only on browser, not in node env (server)
    afterNextRender(() => {
      this.destroyRef.onDestroy(() => {
        if (this.questions) alert('Do you want to leave?');
      });
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.currentRoute) {
        return;
      }
      const { extras } = this.currentRoute;
      const { info } = extras as { info?: { questions: Record<string, any>[] } }
      if (!info) {
        alert('Missing submission data');
        this.location.back();
        return;
      }
      this.questions = info.questions;
    }
  }
}
