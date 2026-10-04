import numpy as np

def confusion_matrix(pred,target,num_classes,ignore=255):
 p=np.asarray(pred).reshape(-1);t=np.asarray(target).reshape(-1);ok=(t!=ignore)&(t>=0)&(t<num_classes)&(p>=0)&(p<num_classes);return np.bincount(num_classes*t[ok]+p[ok],minlength=num_classes**2).reshape(num_classes,num_classes)

def metrics(cm):
 diag=np.diag(cm).astype(float);den=cm.sum(1)+cm.sum(0)-diag;iou=np.divide(diag,den,out=np.full_like(diag,np.nan),where=den>0);acc=diag.sum()/max(cm.sum(),1);return {'accuracy':float(acc*100),'miou':float(np.nanmean(iou)*100),'per_class_iou':[None if np.isnan(x) else float(x*100) for x in iou]}
