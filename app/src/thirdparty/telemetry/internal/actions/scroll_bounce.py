# Copyright 2014 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.
import os

from telemetry.internal.actions import page_action


class ScrollBounceAction(page_action.PageAction):
  def __init__(self, selector=None, text=None, element_function=None,
               left_start_ratio=0.5, top_start_ratio=0.5,
               direction='down', distance=100,
               overscroll=10, repeat_count=10,
               speed_in_pixels_per_second=400,
               synthetic_gesture_source=page_action.GESTURE_SOURCE_DEFAULT):
    super(ScrollBounceAction, self).__init__()
    if direction not in ['down', 'up', 'left', 'right']:
      raise page_action.PageActionNotSupported(
          'Invalid scroll direction: %s' % self.direction)
    self._selector = selector
    self._text = text
    self._element_function = element_function
    self._left_start_ratio = left_start_ratio
    self._top_start_ratio = top_start_ratio
    # Should be big enough to do more than just hide the URL bar.
    self._distance = distance
    self._direction = direction
    # This needs to be < height / repeat_count so we don't walk off the screen.
    # We also probably don't want to spend more than a couple frames in
    # overscroll since it may mask any synthetic delays.
    self._overscroll = overscroll
    # It's the transitions we really want to stress, make this big.
    self._repeat_count = repeat_count
    # 7 pixels per frame should be plenty of frames.
    self._speed = speed_in_pixels_per_second
    self._synthetic_gesture_source = ('chrome.gpuBenchmarking.%s_INPUT' %
                                      synthetic_gesture_source)

    if (self._selector is None and self._text is None and
        self._element_function is None):
      self._element_function = 'document.body'

  def WillRunAction(self, tab):
    for js_file in ['gesture_common.js', 'scroll_bounce.js']:
      with open(os.path.join(os.path.dirname(__file__), js_file)) as f:
        js = f.read()
        tab.ExecuteJavaScript(js)

    # Fail if browser doesn't support synthetic scroll bounce gestures.
    if not tab.EvaluateJavaScript(
        'window.__ScrollBounceAction_SupportedByBrowser()'):
      raise page_action.PageActionNotSupported(
          'Synthetic scroll bounce not supported for this browser')

    # Fail if we can't send touch events (bouncing is really only
    # interesting for touch)
    if not page_action.IsGestureSourceTypeSupported(tab, 'touch'):
      raise page_action.PageActionNotSupported(
          'Touch scroll not supported for this browser')

    if (self._synthetic_gesture_source ==
        'chrome.gpuBenchmarking.MOUSE_INPUT'):
      raise page_action.PageActionNotSupported(
          'ScrollBounce page action does not support mouse input')

    done_callback = 'function() { window.__scrollBounceActionDone = true; }'
    tab.ExecuteJavaScript("""
        window.__scrollBounceActionDone = false;
        window.__scrollBounceAction = new __ScrollBounceAction(%s);"""
        % (done_callback))

  def RunAction(self, tab):
    code = '''
        function(element, info) {
          if (!element) {
            throw Error('Cannot find element: ' + info);
          }
          window.__scrollBounceAction.start({
            element: element,
            left_start_ratio: %s,
            top_start_ratio: %s,
            direction: '%s',
            distance: %s,
            overscroll: %s,
            repeat_count: %s,
            speed: %s
          });
        }''' % (self._left_start_ratio,
                self._top_start_ratio,
                self._direction,
                self._distance,
                self._overscroll,
                self._repeat_count,
                self._speed)
    page_action.EvaluateCallbackWithElement(
        tab, code, selector=self._selector, text=self._text,
        element_function=self._element_function)
    tab.WaitForJavaScriptExpression('window.__scrollBounceActionDone', 60)
