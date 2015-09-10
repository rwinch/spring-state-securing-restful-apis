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
package sample.config;

import java.util.List;

import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.repository.support.Repositories;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.core.projection.ProxyProjectionFactory;
import org.springframework.data.rest.webmvc.config.PersistentEntityResourceAssemblerArgumentResolver;
import org.springframework.hateoas.EntityLinks;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

import sample.security.CsrfTokenArgumentResolver;

@Configuration
public class MvcConfig extends WebMvcConfigurerAdapter implements InitializingBean {

    @Autowired
    private Repositories repositories;
    @Autowired
    private EntityLinks entityLinks;
    @Autowired
    private BeanFactory beanFactory;
    @Autowired
    private RepositoryRestConfiguration config;



    @Override
    public void addArgumentResolvers(
            List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(new PersistentEntityResourceAssemblerArgumentResolver(repositories, entityLinks,
                config.projectionConfiguration(), new ProxyProjectionFactory(beanFactory)));
        argumentResolvers.add(new CsrfTokenArgumentResolver());
    }

    public void afterPropertiesSet() {
    }
}
