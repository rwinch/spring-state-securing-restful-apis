/*
 * Copyright 2002-2013 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package session;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.session.Session;
import org.springframework.session.web.http.HttpSessionStrategy;

public class SmartHttpSessionStrategy implements HttpSessionStrategy {
    private HttpSessionStrategy browser;

    private HttpSessionStrategy api;

    public SmartHttpSessionStrategy(HttpSessionStrategy browser, HttpSessionStrategy api) {
        this.browser = browser;
        this.api = api;
    }

    @Override
    public String getRequestedSessionId(HttpServletRequest request) {
        return getStrategy(request).getRequestedSessionId(request);
    }

    @Override
    public void onNewSession(Session session, HttpServletRequest request,
            HttpServletResponse response) {
        getStrategy(request).onNewSession(session, request, response);
    }

    @Override
    public void onInvalidateSession(HttpServletRequest request,
            HttpServletResponse response) {
        getStrategy(request).onInvalidateSession(request, response);
    }

    private HttpSessionStrategy getStrategy(HttpServletRequest request) {
        return api.getRequestedSessionId(request) != null ? api : browser;
    }
}