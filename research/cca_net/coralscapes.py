"""Coralscapes Cityscapes-style ingestion and validation.
Official structure: root/{leftImg8bit|gtFine}/{split}/{site}/...
"""
from pathlib import Path
from PIL import Image
import numpy as np

SPLITS=('train','val','test')

def image_files(root,split): return sorted((Path(root)/'leftImg8bit'/split).glob('**/*_leftImg8bit.png'))
def mask_for(root,image,split):
 stem=image.name.replace('_leftImg8bit.png',''); base=Path(root)/'gtFine'/split/image.parent.name
 # Prefer labelIds; retain explicit failure rather than guessing another annotation encoding.
 candidates=[base/f'{stem}_gtFine_labelIds.png',base/f'{stem}_gtFine_labelTrainIds.png']
 return next((p for p in candidates if p.exists()),None)

def validate(root,num_classes=39):
 root=Path(root); report={'root':str(root),'splits':{},'valid':True,'warnings':[]}
 for split in SPLITS:
  imgs=image_files(root,split); missing=[]; ids=set(); sizes=set()
  for ip in imgs:
   mp=mask_for(root,ip,split)
   if mp is None: missing.append(str(ip));continue
   with Image.open(ip) as im:sizes.add(im.size)
   with Image.open(mp) as m: ids.update(np.unique(np.asarray(m)).tolist())
  report['splits'][split]={'images':len(imgs),'missing_masks':len(missing),'sizes':[list(x) for x in sorted(sizes)],'label_ids':sorted(ids)}
  if missing: report['valid']=False
  bad=[x for x in ids if x not in range(num_classes) and x not in (255,-1)]
  if bad: report['warnings'].append(f'{split}: label IDs outside 0..{num_classes-1}: {bad}')
 return report
