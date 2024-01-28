from django.template import Library

register = Library()


@register.simple_tag
def query_url(field_name, field_value, urlencode=None):
    url = f"?{field_name}={field_value}"

    if urlencode:
        query_string = urlencode.split("&")
        filtered_query_string = filter(
            lambda a: a.split("=")[0] != field_name, query_string)

        encoded_query_string = "&".join(filtered_query_string)

        if len(encoded_query_string) > 0:
            url = f"{url}&{encoded_query_string}"

    return url
