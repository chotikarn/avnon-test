import { Route } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ReviewComponent } from './pages/review/review.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'review',
    component: ReviewComponent
  }
];
