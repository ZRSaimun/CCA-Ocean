"""Export evaluated artifacts into CCA Ocean's provenance pipeline."""
import argparse,json,shutil
from pathlib import Path
from .evaluate import confusion_matrix,metrics
from PIL import Image
import numpy as np

def main():
 p=argparse.ArgumentParser();p.add_argument('--predictions',required=True);p.add_argument('--ground-truth',required=True);p.add_argument('--classes',type=int,default=39);p.add_argument('--out',default='research/input');a=p.parse_args();pred=Path(a.predictions);gt=Path(a.ground_truth);out=Path(a.out);cm=np.zeros((a.classes,a.classes),dtype=np.int64);pairs=0
 for pp in sorted(pred.glob('*.png')):
  gp=gt/pp.name
  if not gp.exists():continue
  cm+=confusion_matrix(Image.open(pp),Image.open(gp),a.classes);pairs+=1
 (out/'predictions').mkdir(parents=True,exist_ok=True);json.dump({**metrics(cm),'evaluated_pairs':pairs,'confusion_matrix':cm.tolist()},open(out/'metrics.json','w'),indent=2)
 print(f'evaluated {pairs} image pairs; wrote {out}/metrics.json')
if __name__=='__main__':main()
