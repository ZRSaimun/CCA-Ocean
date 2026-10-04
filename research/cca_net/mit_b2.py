"""Optional SegFormer MiT-B2 adapter.

Uses Hugging Face Transformers when installed. Verify the exact pretrained source and
experimental protocol before using results for paper-reproduction claims.
"""
from torch import nn
try:
 from transformers import SegformerModel
except ImportError: SegformerModel=None

class MiTB2Encoder(nn.Module):
 def __init__(self,pretrained='nvidia/mit-b2'):
  super().__init__()
  if SegformerModel is None:raise ImportError('pip install transformers')
  self.backbone=SegformerModel.from_pretrained(pretrained)
 def forward(self,x):
  o=self.backbone(pixel_values=x,output_hidden_states=True,return_dict=True)
  return list(o.hidden_states)
