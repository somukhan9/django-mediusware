from rest_framework import serializers

from .models import Variant, Product, ProductImage, ProductVariant, ProductVariantPrice

import cloudinary
import cloudinary.uploader


class ProductVariantSerializer(serializers.ModelSerializer):
    option = serializers.IntegerField(write_only=True)
    tags = serializers.ListField(write_only=True)

    class Meta:
        model = ProductVariant
        # fields = ["variant_title", "variant", "product"]
        fields = "__all__"
        read_only_fields = ["variant", "product", "variant_title"]
        # write_only_fields = [,]


class ProductVariantPriceSerializer(serializers.ModelSerializer):
    title = serializers.CharField(write_only=True)

    class Meta:
        model = ProductVariantPrice
        fields = "__all__"
        read_only_fields = ["product_variant_one",
                            "product_variant_two", "product_variant_three", "product"]


class ProductImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductImage
        fields = '__all__'
        read_only_fields = ["product", "file_path"]


class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True)
    prices = ProductVariantPriceSerializer(many=True)
    images = ProductImageSerializer(many=True)

    class Meta:
        model = Product
        fields = "__all__"

    def create(self, validated_data):
        variants_data = validated_data.pop('variants')
        prices_data = validated_data.pop('prices')
        images_data = validated_data.pop('images')

        product = Product.objects.create(**validated_data)

        p_v_dictionary = dict()

        variants_list = []

        for variant in variants_data:
            variant_obj = Variant.objects.filter(
                pk=int(variant["option"])
            ).first()

            tags = variant["tags"]

            for tag in tags:
                p_v_dictionary["variant_title"] = tag
                p_v_dictionary["variant"] = variant_obj
                p_v_dictionary["product"] = product

                variants_list.append(
                    ProductVariant.objects.create(**p_v_dictionary)
                )

        p_v_p_dictionary = dict()

        for price in prices_data:

            p_v_p_dictionary["product"] = product

            p_v_p_dictionary["product_variant_one"] = variants_list[0] if len(
                variants_list) >= 1 else None

            p_v_p_dictionary["product_variant_two"] = variants_list[1] if len(
                variants_list) >= 2 else None

            p_v_p_dictionary["product_variant_three"] = variants_list[2] if len(
                variants_list) >= 3 else None

            p_v_p_dictionary["price"] = price["price"]
            p_v_p_dictionary["stock"] = price["stock"]

            ProductVariantPrice.objects.create(**p_v_p_dictionary)

        # Upload image to cloudinary and then store the secure url to the db
        for image in images_data:
            result = cloudinary.uploader.upload(image[0]["path"])

            ProductImage.objects.create(
                product=product,
                file_path=result["secure_url"]
            )

        return product

    def update(self, instance, validated_data):
        instance.title = validated_data.get("title", instance.title)
        instance.sku = validated_data.get("title", instance.sku)
        instance.description = validated_data.get(
            "title", instance.description)

        instance.save()

        # rest of the code to update image, product variant, product variant price

        return instance
