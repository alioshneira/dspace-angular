import { Component } from '@angular/core';
import { Community } from '../../core/shared/community.model';
import { ComColDataService } from '../../core/data/comcol-data.service';
import { NormalizedCommunity } from '../../core/cache/models/normalized-community.model';
import { CommunityDataService } from '../../core/data/community-data.service';
import { CollectionDataService } from '../../core/data/collection-data.service';
import { Collection } from '../../core/shared/collection.model';
import { RouteService } from '../../shared/services/route.service';
import { Router } from '@angular/router';
import { DSOSuccessResponse, ErrorResponse } from '../../core/cache/response-cache.models';
import { Observable } from 'rxjs/Observable';
import { ResponseCacheEntry } from '../../core/cache/response-cache.reducer';
import { map } from 'rxjs/operators';
import { RemoteData } from '../../core/data/remote-data';
import { isNotEmpty } from '../../shared/empty.util';

@Component({
  selector: 'ds-create-collection',
  styleUrls: ['./create-collection-page.component.scss'],
  templateUrl: './create-collection-page.component.html'
})
export class CreateCollectionPageComponent {

  public error$: Observable<ErrorResponse>;
  public parentUUID$: Observable<string>;
  public communityRDObs: Observable<RemoteData<Community>>;

  public constructor(private collectionDataService: CollectionDataService, private communityDataService: CommunityDataService, private routeService: RouteService, private router: Router) {
    this.parentUUID$ = this.routeService.getQueryParameterValue('parent');
    this.parentUUID$.subscribe((uuid: string) => {
      if (isNotEmpty(uuid)) {
        this.communityRDObs = this.communityDataService.findById(uuid);
      }
    });
  }

  onSubmit(data: any) {
    this.parentUUID$.subscribe((uuid: string) => {
      const collection = Object.assign(new Collection(), {
        name: data.name,
        metadata: [
          { key: 'dc.description', value: data.introductory },
          { key: 'dc.description.abstract', value: data.description },
          { key: 'dc.rights', value: data.copyright },
          { key: 'dc.rights.license', value: data.license }
          // TODO: metadata for news and provenance
        ],
        owner: Observable.of(new RemoteData(false, false, true, null, Object.assign(new Community(), {
          id: uuid,
          uuid: uuid
        })))
      });
      this.collectionDataService.create(collection).subscribe((rd: RemoteData<Collection>) => {
        console.log(rd);
        if (rd.hasSucceeded) {
          this.router.navigateByUrl('');
        }
      });
    });
  }

}
