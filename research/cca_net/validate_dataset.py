import argparse,json
from .coralscapes import validate
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('root');p.add_argument('--classes',type=int,default=39);p.add_argument('--out',default='dataset_validation.json');a=p.parse_args();r=validate(a.root,a.classes);open(a.out,'w').write(json.dumps(r,indent=2));print(json.dumps(r,indent=2))
